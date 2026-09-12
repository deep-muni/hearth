'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import { StaffBudgetHeader } from './components/navigation/StaffBudgetHeader';
import { StaffBudgetTabBar } from './components/navigation/StaffBudgetTabBar';
import { MonthBudgetBar } from './components/navigation/MonthBudgetBar';
import { CalendarView } from './components/CalendarView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { ConfigView } from './components/ConfigView';
import { StaffBudgetLoader } from './components/StaffBudgetLoader';
import { useStaffBudget } from './hooks/useStaffBudget';

export default function StaffBudgetPage() {
  const {
    currentMonth,
    setCurrentMonth,
    activeTab,
    setActiveTab,
    staff,
    monthStaff,
    attendance,
    activeStaffId,
    setSelectedStaffId,
    calculations,
    selectedStaffCalc,
    totalMonthlyBudget,
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
  } = useStaffBudget();

  const isInitialLoading = (isPending || isLoading) && staff.length === 0;

  return (
    <Box
      minH="100vh"
      bg="var(--hh-paper)"
      color="var(--hh-ink)"
      transition="background-color 260ms ease, color 260ms ease"
    >
      <Box
        as="main"
        maxW="520px"
        mx="auto"
        px="20px"
        pt="20px"
        pb="56px"
        display="flex"
        flexDirection="column"
        gap="18px"
      >
        <StaffBudgetHeader />

        <StaffBudgetTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab !== 'config' && (
          <MonthBudgetBar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            totalMonthlyBudget={totalMonthlyBudget}
          />
        )}

        <Box w="100%">
          {isInitialLoading ? (
            <StaffBudgetLoader />
          ) : (
            <>
              {activeTab === 'calendar' && (
                <CalendarView
                  staff={monthStaff}
                  selectedStaffId={activeStaffId}
                  onSelectStaff={setSelectedStaffId}
                  currentMonth={currentMonth}
                  attendance={attendance}
                  onSetAttendance={setAttendance}
                  onSetItemCount={setItemCount}
                  onRemoveAttendance={removeAttendance}
                  salaryCalculation={selectedStaffCalc}
                  onNavigateToConfig={() => setActiveTab('config')}
                />
              )}

              {activeTab === 'summary' && (
                <MonthlySummaryView
                  calculations={calculations}
                  currentMonth={currentMonth}
                  onUpdateAdjustment={updateAdjustment}
                />
              )}

              {activeTab === 'config' && (
                <ConfigView
                  staff={staff}
                  currentMonth={currentMonth}
                  onSaveStaff={saveStaff}
                  onDeleteStaff={deleteStaff}
                  onRestoreStaff={restoreStaff}
                  onHardDeleteStaff={hardDeleteStaff}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
