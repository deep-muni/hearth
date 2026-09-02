'use client';

import { useState, useMemo } from 'react';
import { getCurrentMonth } from '@/utils/dateUtils';
import { calculateMonthlySalary } from '@/utils/salaryCalculator';
import {
  AttendanceRecord,
  AttendanceStatus,
  HelperSalaryCalculation,
  HouseHelp,
  MonthlyAdjustment,
} from '@/types';
import {
  useHelpersQuery,
  useSaveHelperMutation,
  useDeleteHelperMutation,
  useRestoreHelperMutation,
} from '@/queries/useHelpers';
import {
  useAttendanceQuery,
  useSetAttendanceMutation,
  useRemoveAttendanceMutation,
} from '@/queries/useAttendance';
import { useAdjustmentsQuery, useUpdateAdjustmentMutation } from '@/queries/useAdjustments';
import { apiClient } from '@/api/client';
import { storageService } from '@/services/storageService';

export function isHelperActiveInMonth(
  helper: HouseHelp,
  month: string,
  attendanceRecords: AttendanceRecord[],
  adjustmentsMap: Record<string, MonthlyAdjustment>
): boolean {
  const hasAttendance = attendanceRecords.some(
    (a) => a.helperId === helper.id && a.date.startsWith(month)
  );
  if (hasAttendance) return true;

  const adj = adjustmentsMap[`${helper.id}_${month}`];
  if (adj && (adj.isPaid || adj.bonus > 0 || adj.advanceDeduction > 0 || adj.note)) {
    return true;
  }

  if (helper.joinDate) {
    const joinMonth = helper.joinDate.substring(0, 7);
    if (month < joinMonth) return false;
  }

  if (helper.leftDate) {
    const leftMonth = helper.leftDate.substring(0, 7);
    if (month >= leftMonth) return false;
    return true;
  }

  if (helper.isActive === false) return false;

  return true;
}

export function useHouseHelp() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary' | 'config'>('calendar');
  const [selectedHelperId, setSelectedHelperId] = useState<string>('');

  const { data: helpers = [] } = useHelpersQuery(true);
  const { data: attendance = [] } = useAttendanceQuery();
  const { data: adjustmentsList = [] } = useAdjustmentsQuery();

  const adjustments = useMemo(() => {
    const map: Record<string, MonthlyAdjustment> = {};
    for (const a of adjustmentsList) {
      map[`${a.helperId}_${a.month}`] = a;
    }
    return map;
  }, [adjustmentsList]);

  const saveHelperMutation = useSaveHelperMutation();
  const deleteHelperMutation = useDeleteHelperMutation();
  const restoreHelperMutation = useRestoreHelperMutation();
  const setAttendanceMutation = useSetAttendanceMutation();
  const removeAttendanceMutation = useRemoveAttendanceMutation();
  const updateAdjustmentMutation = useUpdateAdjustmentMutation();

  const monthHelpers = useMemo(() => {
    return helpers.filter((h) => isHelperActiveInMonth(h, currentMonth, attendance, adjustments));
  }, [helpers, attendance, adjustments, currentMonth]);

  const activeHelperId =
    (monthHelpers.some((h) => h.id === selectedHelperId) ? selectedHelperId : '') ||
    (monthHelpers[0]?.id ?? '');

  const calculations: HelperSalaryCalculation[] = useMemo(() => {
    return monthHelpers.map((helper) => {
      const helperRecords = attendance.filter(
        (a) => a.helperId === helper.id && a.date.startsWith(currentMonth)
      );
      const adjustment = adjustments[`${helper.id}_${currentMonth}`];
      return calculateMonthlySalary(helper, currentMonth, helperRecords, adjustment);
    });
  }, [monthHelpers, attendance, adjustments, currentMonth]);

  const selectedHelperCalc = useMemo(() => {
    return calculations.find((c) => c.helper.id === activeHelperId);
  }, [calculations, activeHelperId]);

  const totalMonthlyBudget = useMemo(() => {
    return calculations.reduce((sum, c) => sum + c.netPayable, 0);
  }, [calculations]);

  const setAttendance = (
    helperId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    setAttendanceMutation.mutate({ helperId, date, status, note });
  };

  const setItemCount = (
    helperId: string,
    date: string,
    count: number,
    note?: string,
    customRate?: number
  ) => {
    setAttendanceMutation.mutate({ helperId, date, itemCount: count, note, customRate });
  };

  const removeAttendance = (helperId: string, date: string) => {
    removeAttendanceMutation.mutate({ helperId, date });
  };

  const updateAdjustment = (adj: MonthlyAdjustment) => {
    updateAdjustmentMutation.mutate(adj);
  };

  const saveHelper = (helper: HouseHelp) => {
    saveHelperMutation.mutate(helper);
    if (!selectedHelperId) {
      setSelectedHelperId(helper.id);
    }
  };

  const deleteHelper = (id: string) => {
    deleteHelperMutation.mutate({ id, hard: false, leftDate: currentMonth });
    if (selectedHelperId === id) {
      setSelectedHelperId('');
    }
  };

  const restoreHelper = (id: string) => {
    restoreHelperMutation.mutate(id);
  };

  const hardDeleteHelper = (id: string) => {
    deleteHelperMutation.mutate({ id, hard: true });
    if (selectedHelperId === id) {
      setSelectedHelperId('');
    }
  };

  const resetDemo = () => {
    storageService.resetToDemoData();
    window.location.reload();
  };

  const exportBackup = async () => {
    const data = await apiClient.exportBackup();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-help-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (!data || !Array.isArray(data.helpers)) return false;
      apiClient.importBackup(data).then(() => {
        window.location.reload();
      });
      return true;
    } catch {
      return false;
    }
  };

  return {
    currentMonth,
    setCurrentMonth,
    activeTab,
    setActiveTab,
    helpers,
    monthHelpers,
    attendance,
    activeHelperId,
    setSelectedHelperId,
    calculations,
    selectedHelperCalc,
    totalMonthlyBudget,
    setAttendance,
    setItemCount,
    removeAttendance,
    updateAdjustment,
    saveHelper,
    deleteHelper,
    restoreHelper,
    hardDeleteHelper,
    resetDemo,
    exportBackup,
    importBackup,
  };
}
