'use client';

import { useMemo, useCallback } from 'react';
import { SalaryAdjustment, StaffSalaryCalculation } from '../types';
import { calculateMonthlySalary } from '../utils/salaryCalculator';
import {
  useGetStaff,
  useGetAttendance,
  useGetAdjustments,
  useSaveAdjustment,
} from '@/data/staff-budget/queries';

export function useSalarySummary(currentMonth: string, selectedStaffId?: string) {
  const {
    data: rawStaff,
    isLoading: isStaffLoading,
    isPending: isStaffPending,
  } = useGetStaff(true);
  const {
    data: rawAttendance,
    isLoading: isAttendanceLoading,
    isPending: isAttendancePending,
  } = useGetAttendance(currentMonth);
  const {
    data: rawAdjustmentsList,
    isLoading: isAdjustmentsLoading,
    isPending: isAdjustmentsPending,
  } = useGetAdjustments(currentMonth);
  const saveAdjustmentMutation = useSaveAdjustment();

  const staff = useMemo(() => {
    return Array.isArray(rawStaff) ? rawStaff : [];
  }, [rawStaff]);

  const attendance = useMemo(() => {
    return Array.isArray(rawAttendance) ? rawAttendance : [];
  }, [rawAttendance]);

  const adjustmentsList = useMemo(() => {
    return Array.isArray(rawAdjustmentsList) ? rawAdjustmentsList : [];
  }, [rawAdjustmentsList]);

  const adjustments = useMemo(() => {
    const map: Record<string, SalaryAdjustment> = {};
    adjustmentsList.forEach((adj) => {
      const key = `${adj.staffId}_${adj.month}`;
      map[key] = adj;
    });
    return map;
  }, [adjustmentsList]);

  const calculations: StaffSalaryCalculation[] = useMemo(() => {
    return staff
      .filter((h) => h.isActive !== false || (h.leftDate && h.leftDate >= currentMonth))
      .map((member) => {
        const key = `${member.id}_${currentMonth}`;
        return calculateMonthlySalary(member, currentMonth, attendance, adjustments[key]);
      });
  }, [staff, currentMonth, attendance, adjustments]);

  const totalMonthlyBudget = useMemo(() => {
    return calculations.reduce((sum, c) => sum + c.netPayable, 0);
  }, [calculations]);

  const selectedStaffCalc = useMemo(() => {
    if (!selectedStaffId) return calculations[0];
    return calculations.find((c) => c.staff.id === selectedStaffId);
  }, [calculations, selectedStaffId]);

  const totalPaid = useMemo(() => {
    return calculations
      .filter((c) => c.adjustment.isPaid)
      .reduce((acc, c) => acc + c.netPayable, 0);
  }, [calculations]);

  const totalPending = totalMonthlyBudget - totalPaid;

  const updateAdjustment = useCallback(
    (adj: SalaryAdjustment) => {
      saveAdjustmentMutation.mutate(adj);
    },
    [saveAdjustmentMutation]
  );

  const isLoading = isStaffLoading || isAttendanceLoading || isAdjustmentsLoading;
  const isPending = isStaffPending || isAttendancePending || isAdjustmentsPending;

  return {
    calculations,
    totalMonthlyBudget,
    totalPaid,
    totalPending,
    selectedStaffCalc,
    adjustments,
    isLoading,
    isPending,
    updateAdjustment,
  };
}
