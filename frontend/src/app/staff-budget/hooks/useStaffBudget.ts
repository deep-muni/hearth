'use client';

import { useState, useMemo } from 'react';
import { getCurrentMonth } from '@/utils/dateUtils';
import { ActiveTab } from '../types';
import { useStaff } from './useStaff';
import { useAttendanceRecords } from './useAttendanceRecords';
import { useSalarySummary } from './useSalarySummary';

export function useStaffBudget(initialMonth?: string) {
  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth || getCurrentMonth());
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const {
    staff,
    activeStaff,
    monthStaff,
    isLoading: isStaffLoading,
    isPending: isStaffPending,
    saveStaff,
    deleteStaff,
    restoreStaff,
    hardDeleteStaff,
  } = useStaff(currentMonth);

  const {
    attendance,
    isLoading: isAttendanceLoading,
    isPending: isAttendancePending,
    setAttendance,
    setItemCount,
    removeAttendance,
  } = useAttendanceRecords(currentMonth);

  const activeStaffId = useMemo(() => {
    if (selectedStaffId && monthStaff.some((h) => h.id === selectedStaffId)) {
      return selectedStaffId;
    }
    return monthStaff[0]?.id || '';
  }, [selectedStaffId, monthStaff]);

  const {
    calculations,
    totalMonthlyBudget,
    totalPaid,
    totalPending,
    selectedStaffCalc,
    adjustments,
    isLoading: isSalaryLoading,
    isPending: isSalaryPending,
    updateAdjustment,
  } = useSalarySummary(currentMonth, activeStaffId);

  const isLoading = isStaffLoading || isAttendanceLoading || isSalaryLoading;
  const isPending = isStaffPending || isAttendancePending || isSalaryPending;

  return {
    currentMonth,
    setCurrentMonth,
    activeTab,
    setActiveTab,
    selectedStaffId,
    setSelectedStaffId,
    activeStaffId,
    staff,
    activeStaff,
    monthStaff,
    attendance,
    adjustments,
    calculations,
    selectedStaffCalc,
    totalMonthlyBudget,
    totalPaid,
    totalPending,
    isLoading,
    isPending,
    setAttendance,
    setItemCount,
    removeAttendance,
    updateAdjustment,
    saveStaff,
    deleteStaff,
    restoreStaff,
    hardDeleteStaff,
  };
}
