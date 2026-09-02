"use client";
import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { Box, Container, Text } from '@chakra-ui/react';
import { Header } from '@/components/common/Header';
import { CalendarView } from '@/components/calendar/CalendarView';
import { MonthlySummaryView } from '@/components/summary/MonthlySummaryView';
import { ConfigView } from '@/components/config/ConfigView';
import { storageService, EMPTY_HELPERS, EMPTY_ATTENDANCE } from '@/services/storageService';
import { getCurrentMonth } from '@/utils/dateUtils';
import { calculateMonthlySalary } from '@/utils/salaryCalculator';
import { AttendanceStatus, HelperSalaryCalculation, HouseHelp, MonthlyAdjustment } from '@/types';

const subscribeStorage = (cb: () => void) => storageService.subscribe(cb);
const getHelpersSnapshot = () => storageService.getHelpers();
const getHelpersServerSnapshot = () => EMPTY_HELPERS;
const getAttendanceSnapshot = () => storageService.getAttendance();
const getAttendanceServerSnapshot = () => EMPTY_ATTENDANCE;
const subscribeClient = () => () => {};
const getClientSnapshot = () => true;
const getClientServerSnapshot = () => false;

export default function HomePage() {
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary' | 'config'>('calendar');
  const [selectedHelperId, setSelectedHelperId] = useState<string>('');

  const isClient = useSyncExternalStore(
    subscribeClient,
    getClientSnapshot,
    getClientServerSnapshot
  );

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

  const activeHelperId = selectedHelperId || (helpers[0]?.id ?? '');

  // Calculate salaries for all helpers for the selected month
  const calculations: HelperSalaryCalculation[] = useMemo(() => {
    return helpers.map((h) => {
      const adjustment = storageService.getAdjustment(h.id, currentMonth);
      return calculateMonthlySalary(h, currentMonth, attendance, adjustment);
    });
  }, [helpers, currentMonth, attendance]);

  const selectedHelperCalc = useMemo(() => {
    return calculations.find((c) => c.helper.id === activeHelperId);
  }, [calculations, activeHelperId]);

  const totalMonthlyBudget = useMemo(() => {
    return calculations.reduce((sum, c) => sum + c.netPayable, 0);
  }, [calculations]);

  // Handlers
  const handleSetAttendance = (
    helperId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    storageService.setAttendance({ helperId, date, status, note });
  };

  const handleRemoveAttendance = (helperId: string, date: string) => {
    storageService.removeAttendance(helperId, date);
  };

  const handleClearMonth = (helperId: string, month: string) => {
    storageService.clearMonthAttendance(helperId, month);
  };

  const handleUpdateAdjustment = (adj: MonthlyAdjustment) => {
    storageService.saveAdjustment(adj);
  };

  const handleSaveHelper = (helper: HouseHelp) => {
    storageService.saveHelper(helper);
    setSelectedHelperId(helper.id);
  };

  const handleDeleteHelper = (id: string) => {
    storageService.deleteHelper(id);
  };

  const handleResetDemo = () => {
    if (confirm('Reset to demo helpers and attendance? This will restore the sample staff.')) {
      storageService.resetToDemoData();
    }
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-help-budget-backup-${currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    return storageService.importBackup(jsonStr);
  };

  if (!isClient) {
    return (
      <Box p={10} textAlign="center">
        <Text fontSize="lg" color="pink.500" fontWeight="bold">
          🌸 Loading HouseHelp Budget...
        </Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* App Header */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalMonthlyBudget={totalMonthlyBudget}
      />

      {/* Main Content View */}
      <Box as="main" flex="1" py={{ base: 3, md: 5 }} px={{ base: 3, md: 4 }} pb={{ base: "84px", md: "24px" }}>
        <Container maxW="580px" p={0}>
          {activeTab === 'calendar' && (
            <CalendarView
              helpers={helpers}
              selectedHelperId={activeHelperId}
              onSelectHelper={setSelectedHelperId}
              currentMonth={currentMonth}
              attendance={attendance}
              onSetAttendance={handleSetAttendance}
              onRemoveAttendance={handleRemoveAttendance}
              onClearMonth={handleClearMonth}
              salaryCalculation={selectedHelperCalc}
            />
          )}

          {activeTab === 'summary' && (
            <MonthlySummaryView
              calculations={calculations}
              currentMonth={currentMonth}
              onUpdateAdjustment={handleUpdateAdjustment}
            />
          )}

          {activeTab === 'config' && (
            <ConfigView
              helpers={helpers}
              onSaveHelper={handleSaveHelper}
              onDeleteHelper={handleDeleteHelper}
              onResetDemo={handleResetDemo}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
}
