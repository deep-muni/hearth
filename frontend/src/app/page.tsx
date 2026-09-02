"use client";

import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Header } from '@/components/common/Header';
import { CalendarView } from '@/components/calendar/CalendarView';
import { MonthlySummaryView } from '@/components/summary/MonthlySummaryView';
import { ConfigView } from '@/components/config/ConfigView';
import { useHouseHelp } from '@/hooks/useHouseHelp';

export default function HomePage() {
  const {
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
    resetDemo,
    exportBackup,
    importBackup,
  } = useHouseHelp();

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalMonthlyBudget={totalMonthlyBudget}
      />

      <Box as="main" flex="1" pt={4} pb={12} px={3}>
        <Container maxW="440px" p={0}>
          {activeTab === 'calendar' && (
            <CalendarView
              helpers={monthHelpers}
              selectedHelperId={activeHelperId}
              onSelectHelper={setSelectedHelperId}
              currentMonth={currentMonth}
              attendance={attendance}
              onSetAttendance={setAttendance}
              onSetItemCount={setItemCount}
              onRemoveAttendance={removeAttendance}
              salaryCalculation={selectedHelperCalc}
              onNavigateToSummary={() => setActiveTab('summary')}
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
              helpers={helpers}
              onSaveHelper={saveHelper}
              onDeleteHelper={deleteHelper}
              onRestoreHelper={restoreHelper}
              onResetDemo={resetDemo}
              onExportBackup={exportBackup}
              onImportBackup={importBackup}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
}
