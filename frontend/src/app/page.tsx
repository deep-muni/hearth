"use client";
import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { Box, Container, Text, HStack, Badge, Flex } from '@chakra-ui/react';
import { Header } from '@/components/common/Header';
import { CalendarView } from '@/components/calendar/CalendarView';
import { MonthlySummaryView } from '@/components/summary/MonthlySummaryView';
import { ConfigView } from '@/components/config/ConfigView';
import { storageService } from '@/services/storageService';
import { getCurrentMonth } from '@/utils/dateUtils';
import { calculateMonthlySalary } from '@/utils/salaryCalculator';
import { AttendanceStatus, HelperSalaryCalculation, HouseHelp, MonthlyAdjustment } from '@/types';
import { Heart, Server } from 'lucide-react';

export default function HomePage() {
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary' | 'config'>('calendar');
  const [selectedHelperId, setSelectedHelperId] = useState<string>('');

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const helpers = useSyncExternalStore(
    (cb) => storageService.subscribe(cb),
    () => storageService.getHelpers(),
    () => []
  );

  const attendance = useSyncExternalStore(
    (cb) => storageService.subscribe(cb),
    () => storageService.getAttendance(),
    () => []
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
        totalHelpersCount={helpers.length}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content View */}
      <Box as="main" flex="1" py={8} px={{ base: 4, md: 8 }}>
        <Container maxW="1400px" p={0}>
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

      {/* Cute Footer */}
      <Box
        as="footer"
        py={6}
        px={4}
        mt="auto"
        borderTop="1px solid"
        borderColor="pink.100"
        bg="rgba(255, 255, 255, 0.7)"
        backdropFilter="blur(6px)"
      >
        <Flex
          maxW="1400px"
          mx="auto"
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          gap={3}
          fontSize="xs"
          color="gray.500"
        >
          <HStack gap={2}>
            <Text fontWeight="700" color="pink.600">
              🌸 HouseHelp Budget
            </Text>
            <Text>•</Text>
            <Text>Built with TypeScript, Next.js, Chakra UI & Go</Text>
          </HStack>

          <HStack gap={3}>
            <Badge
              bg="emerald.50"
              color="emerald.700"
              border="1px solid"
              borderColor="emerald.200"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="10px"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Server size={10} />
              <span>In-Memory / LocalStorage Active • Go API Ready</span>
            </Badge>

            <HStack gap={1} color="pink.600" fontWeight="600">
              <span>Crafted with</span>
              <Heart size={13} fill="#ec4899" stroke="#ec4899" />
              <span>for happy households</span>
            </HStack>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
