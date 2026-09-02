'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import {
  storageService,
  EMPTY_HELPERS,
  EMPTY_ATTENDANCE,
  EMPTY_ADJUSTMENTS,
} from '@/services/storageService';
import { getCurrentMonth } from '@/utils/dateUtils';
import { calculateMonthlySalary } from '@/utils/salaryCalculator';
import { AttendanceStatus, HelperSalaryCalculation, HouseHelp, MonthlyAdjustment } from '@/types';

const subscribeStorage = (cb: () => void) => storageService.subscribe(cb);
const getHelpersSnapshot = () => storageService.getHelpers();
const getAttendanceSnapshot = () => storageService.getAttendance();
const getAdjustmentsSnapshot = () => storageService.getAdjustments();
const getHelpersServerSnapshot = () => EMPTY_HELPERS;
const getAttendanceServerSnapshot = () => EMPTY_ATTENDANCE;
const getAdjustmentsServerSnapshot = () => EMPTY_ADJUSTMENTS;

export function useHouseHelp() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary' | 'config'>('calendar');
  const [selectedHelperId, setSelectedHelperId] = useState<string>('');

  const helpers = useSyncExternalStore(
    subscribeStorage,
    getHelpersSnapshot,
    getHelpersServerSnapshot
  );

  const attendance = useSyncExternalStore(
    subscribeStorage,
    getAttendanceSnapshot,
    getAttendanceServerSnapshot
  );

  const adjustments = useSyncExternalStore(
    subscribeStorage,
    getAdjustmentsSnapshot,
    getAdjustmentsServerSnapshot
  );

  const monthHelpers = useMemo(() => {
    return helpers.filter((h) => {
      const hasAttendance = attendance.some(
        (a) => a.helperId === h.id && a.date.startsWith(currentMonth)
      );
      if (hasAttendance) return true;

      if (h.joinDate) {
        const joinMonth = h.joinDate.substring(0, 7);
        if (currentMonth < joinMonth) return false;
      }

      if (h.leftDate) {
        const leftMonth = h.leftDate.substring(0, 7);
        if (currentMonth > leftMonth) return false;
      }

      if (h.isActive === false) return false;

      return true;
    });
  }, [helpers, attendance, currentMonth]);

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
    storageService.setAttendance({ helperId, date, status, note });
  };

  const setItemCount = (
    helperId: string,
    date: string,
    count: number,
    note?: string,
    customRate?: number
  ) => {
    storageService.setItemCount(helperId, date, count, note, customRate);
  };

  const removeAttendance = (helperId: string, date: string) => {
    storageService.removeAttendance(helperId, date);
  };

  const updateAdjustment = (adj: MonthlyAdjustment) => {
    storageService.saveAdjustment(adj);
  };

  const saveHelper = (helper: HouseHelp) => {
    storageService.saveHelper(helper);
    if (!selectedHelperId) {
      setSelectedHelperId(helper.id);
    }
  };

  const deleteHelper = (id: string) => {
    storageService.deleteHelper(id, currentMonth);
    if (selectedHelperId === id) {
      setSelectedHelperId('');
    }
  };

  const restoreHelper = (id: string) => {
    storageService.restoreHelper(id);
  };

  const hardDeleteHelper = (id: string) => {
    storageService.hardDeleteHelper(id);
    if (selectedHelperId === id) {
      setSelectedHelperId('');
    }
  };

  const resetDemo = () => {
    storageService.resetToDemoData();
  };

  const exportBackup = () => {
    const json = storageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-help-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (json: string) => {
    return storageService.importBackup(json);
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
