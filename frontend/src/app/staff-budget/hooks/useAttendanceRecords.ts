'use client';

import { useCallback, useMemo } from 'react';
import { AttendanceStatus } from '../types';
import {
  useGetAttendance,
  useSaveAttendance,
  useDeleteAttendance,
} from '@/data/staff-budget/queries';

export function useAttendanceRecords(currentMonth: string) {
  const { data: rawAttendance, isLoading, isPending } = useGetAttendance(currentMonth);
  const saveAttendanceMutation = useSaveAttendance();
  const deleteAttendanceMutation = useDeleteAttendance();

  const attendance = useMemo(() => {
    return Array.isArray(rawAttendance) ? rawAttendance : [];
  }, [rawAttendance]);

  const setAttendance = useCallback(
    (staffId: string, date: string, status: AttendanceStatus, note?: string) => {
      saveAttendanceMutation.mutate({ staffId, date, status, note });
    },
    [saveAttendanceMutation]
  );

  const setItemCount = useCallback(
    (staffId: string, date: string, count: number, note?: string, customRate?: number) => {
      saveAttendanceMutation.mutate({
        staffId,
        date,
        itemCount: count,
        customRate,
        note,
      });
    },
    [saveAttendanceMutation]
  );

  const removeAttendance = useCallback(
    (staffId: string, date: string) => {
      deleteAttendanceMutation.mutate({ staffId, date });
    },
    [deleteAttendanceMutation]
  );

  return {
    attendance,
    isLoading,
    isPending,
    isSaving: saveAttendanceMutation.isPending || deleteAttendanceMutation.isPending,
    setAttendance,
    setItemCount,
    removeAttendance,
  };
}
