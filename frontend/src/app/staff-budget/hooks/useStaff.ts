'use client';

import { useMemo, useCallback } from 'react';
import { StaffMember } from '../types';
import {
  useGetStaff,
  useSaveStaff,
  useDeleteStaff,
  useRestoreStaff,
} from '@/data/staff-budget/queries';

export function useStaff(currentMonth?: string) {
  const { data: rawStaff, isLoading, isPending } = useGetStaff(true);
  const saveStaffMutation = useSaveStaff();
  const deleteStaffMutation = useDeleteStaff();
  const restoreStaffMutation = useRestoreStaff();

  const staff = useMemo(() => {
    return Array.isArray(rawStaff) ? rawStaff : [];
  }, [rawStaff]);

  const activeStaff = useMemo(() => {
    return staff.filter((h) => h.isActive !== false);
  }, [staff]);

  const monthStaff = useMemo(() => {
    if (!currentMonth) return activeStaff;
    return staff.filter((h) => {
      if (h.isActive === false && h.leftDate && currentMonth > h.leftDate) {
        return false;
      }
      return true;
    });
  }, [staff, activeStaff, currentMonth]);

  const saveStaff = useCallback(
    (member: StaffMember) => {
      saveStaffMutation.mutate(member);
    },
    [saveStaffMutation]
  );

  const deleteStaff = useCallback(
    (id: string) => {
      deleteStaffMutation.mutate({ id, hard: false, leftDate: currentMonth });
    },
    [deleteStaffMutation, currentMonth]
  );

  const restoreStaff = useCallback(
    (id: string) => {
      restoreStaffMutation.mutate(id);
    },
    [restoreStaffMutation]
  );

  const hardDeleteStaff = useCallback(
    (id: string) => {
      deleteStaffMutation.mutate({ id, hard: true });
    },
    [deleteStaffMutation]
  );

  return {
    staff,
    activeStaff,
    monthStaff,
    isLoading,
    isPending,
    isSaving: saveStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
    saveStaff,
    deleteStaff,
    restoreStaff,
    hardDeleteStaff,
  };
}
