'use client';

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
    hardDeleteHelper,
    resetDemo,
    exportBackup,
    importBackup,
  } = useHouseHelp();

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      bg="var(--bg-app)"
      color="var(--text-primary)"
      transition="background-color 0.15s ease, color 0.15s ease"
    >
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
              currentMonth={currentMonth}
              onSaveHelper={saveHelper}
              onDeleteHelper={deleteHelper}
              onRestoreHelper={restoreHelper}
              onHardDeleteHelper={hardDeleteHelper}
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
