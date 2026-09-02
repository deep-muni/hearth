"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, HelperSalaryCalculation, HouseHelp } from '@/types';
import {
  buildCalendarDays,
  CalendarDayInfo,
  formatCurrency,
} from '@/utils/dateUtils';
import { DayDetailModal } from './DayDetailModal';

interface CalendarViewProps {
  helpers: HouseHelp[];
  selectedHelperId: string;
  onSelectHelper: (id: string) => void;
  currentMonth: string;
  attendance: AttendanceRecord[];
  onSetAttendance: (helperId: string, date: string, status: AttendanceStatus, note?: string) => void;
  onRemoveAttendance: (helperId: string, date: string) => void;
  onClearMonth: (helperId: string, month: string) => void;
  salaryCalculation?: HelperSalaryCalculation;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  helpers,
  selectedHelperId,
  onSelectHelper,
  currentMonth,
  attendance,
  onSetAttendance,
  onRemoveAttendance,
  onClearMonth,
  salaryCalculation,
}) => {
  const selectedHelper = helpers.find((h) => h.id === selectedHelperId) || helpers[0];
  const [modalDate, setModalDate] = useState<string | null>(null);

  if (!selectedHelper) {
    return (
      <Box p={6} textAlign="center">
        <Text fontSize="sm" color="#64748b">
          No house staff added yet. Head to the Staff tab to add one.
        </Text>
      </Box>
    );
  }

  const calendarDays = buildCalendarDays(currentMonth);

  // Map attendance records
  const recordsByDate = new Map<string, AttendanceRecord>();
  attendance
    .filter((a) => a.helperId === selectedHelper.id && a.date.startsWith(currentMonth))
    .forEach((r) => recordsByDate.set(r.date, r));

  const handleCellClick = (dayInfo: CalendarDayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    setModalDate(dayInfo.dateStr);
  };

  const handleQuickMarkAllPresent = () => {
    if (confirm(`Fill all working days in ${currentMonth} as Present for ${selectedHelper.name}?`)) {
      calendarDays
        .filter((d) => d.isCurrentMonth)
        .forEach((d) => {
          const isWeeklyOff = selectedHelper.weeklyOffDay >= 0 && d.dayOfWeek === selectedHelper.weeklyOffDay;
          if (isWeeklyOff) {
            onSetAttendance(selectedHelper.id, d.dateStr, 'WEEKLY_OFF');
          } else {
            onSetAttendance(selectedHelper.id, d.dateStr, 'PRESENT');
          }
        });
    }
  };

  const currentRecord = modalDate ? recordsByDate.get(modalDate) : undefined;

  return (
    <VStack gap={4} align="stretch" maxW="580px" mx="auto" w="100%">
      {/* 1. Minimal Staff Pill Selector */}
      <Flex gap={2} overflowX="auto" pb={1} className="no-scrollbar">
        {helpers.map((h) => {
          const isSelected = h.id === selectedHelper.id;
          const helperRecords = attendance.filter(
            (a) => a.helperId === h.id && a.date.startsWith(currentMonth)
          );
          const leaves = helperRecords.reduce((acc, curr) => {
            if (curr.status === 'FULL_LEAVE') return acc + 1;
            if (curr.status === 'HALF_LEAVE') return acc + 0.5;
            return acc;
          }, 0);

          return (
            <button
              key={h.id}
              onClick={() => onSelectHelper(h.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1.5px solid',
                borderColor: isSelected ? '#f43f5e' : '#e2e8f0',
                background: isSelected ? '#fff1f2' : '#ffffff',
                color: isSelected ? '#9f1239' : '#334155',
                fontSize: '13px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{h.avatarEmoji}</span>
              <span>{h.name.split(' ')[0]}</span>
              {leaves > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '9999px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 700,
                  }}
                >
                  {leaves} off
                </span>
              )}
            </button>
          );
        })}
      </Flex>

      {/* 2. Compact Helper Info Bar */}
      <Flex
        bg="#ffffff"
        borderRadius="2xl"
        px={3.5}
        py={2.5}
        border="1px solid #f1f5f9"
        justify="space-between"
        align="center"
        fontSize="12px"
        boxShadow="0 1px 3px rgba(0,0,0,0.03)"
      >
        <Box>
          <Text fontWeight="800" color="#1e293b">
            {selectedHelper.name} <span style={{ color: '#64748b', fontWeight: 500 }}>({selectedHelper.role})</span>
          </Text>
          <Text fontSize="11px" color="#64748b">
            {selectedHelper.salaryType === 'FIXED_MONTHLY' && `${formatCurrency(selectedHelper.baseSalary)}/mo • ${selectedHelper.paidLeavesAllowance} paid leaves`}
            {selectedHelper.salaryType === 'DAILY_WAGE' && `${formatCurrency(selectedHelper.baseSalary)}/day worked`}
            {selectedHelper.salaryType === 'STRICT_FLAT' && `${formatCurrency(selectedHelper.baseSalary)} flat pay`}
          </Text>
        </Box>

        <HStack gap={2}>
          {salaryCalculation && (
            <Text fontWeight="800" color="#e11d48">
              {formatCurrency(salaryCalculation.netPayable)}
            </Text>
          )}

          <button
            onClick={handleQuickMarkAllPresent}
            title="Mark all as present"
            style={{
              padding: '4px 9px',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              background: '#f0fdf4',
              color: '#166534',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Fill Present
          </button>

          <button
            onClick={() => {
              if (confirm(`Clear all attendance for ${selectedHelper.name} in ${currentMonth}?`)) {
                onClearMonth(selectedHelper.id, currentMonth);
              }
            }}
            title="Clear month"
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              color: '#9a3412',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </HStack>
      </Flex>

      {/* 3. Mobile-Optimized 7-Column Calendar Card */}
      <Box
        bg="#ffffff"
        borderRadius="2xl"
        p={{ base: 2.5, md: 4 }}
        border="1px solid #fecdd3"
        boxShadow="0 2px 10px rgba(255, 107, 139, 0.08)"
      >
        {/* Day Headers */}
        <SimpleGrid columns={7} gap={1} mb={2}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Box key={i} textAlign="center" py={1}>
              <Text
                fontSize="11px"
                fontWeight="800"
                color={i === 0 ? '#e11d48' : '#64748b'}
              >
                {d}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Days Grid */}
        <SimpleGrid columns={7} gap={{ base: 1, sm: 1.5 }}>
          {calendarDays.map((dayInfo, idx) => {
            const isWeeklyOffDay =
              selectedHelper.weeklyOffDay >= 0 && dayInfo.dayOfWeek === selectedHelper.weeklyOffDay;
            const record = recordsByDate.get(dayInfo.dateStr);

            let effectiveStatus: AttendanceStatus = 'PRESENT';
            if (record) {
              effectiveStatus = record.status;
            } else if (isWeeklyOffDay) {
              effectiveStatus = 'WEEKLY_OFF';
            }

            // Minimal, clean badge styling
            let cellBg = '#ffffff';
            let cellBorder = '#f1f5f9';
            let dotColor = '#10b981'; // green for present

            if (!dayInfo.isCurrentMonth) {
              cellBg = '#fafafa';
              cellBorder = '#f8fafc';
            } else {
              switch (effectiveStatus) {
                case 'FULL_LEAVE':
                  cellBg = '#fff1f2';
                  cellBorder = '#fecdd3';
                  dotColor = '#e11d48';
                  break;
                case 'HALF_LEAVE':
                  cellBg = '#fffbeb';
                  cellBorder = '#fde68a';
                  dotColor = '#f59e0b';
                  break;
                case 'PAID_LEAVE':
                  cellBg = '#f5f3ff';
                  cellBorder = '#ddd6fe';
                  dotColor = '#8b5cf6';
                  break;
                case 'WEEKLY_OFF':
                  cellBg = '#f8fafc';
                  cellBorder = '#e2e8f0';
                  dotColor = '#94a3b8';
                  break;
                case 'PRESENT':
                default:
                  cellBg = '#f0fdf4';
                  cellBorder = '#dcfce7';
                  dotColor = '#10b981';
                  break;
              }
            }

            return (
              <Box
                key={`${dayInfo.dateStr}-${idx}`}
                onClick={() => handleCellClick(dayInfo)}
                minH={{ base: '44px', sm: '52px' }}
                p={1}
                borderRadius="xl"
                border="1.5px solid"
                borderColor={dayInfo.isToday ? '#f43f5e' : cellBorder}
                bg={cellBg}
                opacity={dayInfo.isCurrentMonth ? 1 : 0.3}
                cursor={dayInfo.isCurrentMonth ? 'pointer' : 'default'}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="space-between"
                transition="transform 0.1s"
                _active={{ transform: 'scale(0.95)' }}
              >
                {/* Day number */}
                <Text
                  fontSize="12px"
                  fontWeight={dayInfo.isToday ? '800' : '600'}
                  color={dayInfo.isToday ? '#e11d48' : dayInfo.isCurrentMonth ? '#1e293b' : '#cbd5e1'}
                  lineHeight="1"
                  mt={0.5}
                >
                  {dayInfo.dayNumber}
                </Text>

                {/* Minimal status indicator dot */}
                {dayInfo.isCurrentMonth && (
                  <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg={dotColor}
                    mb={1}
                    boxShadow={dayInfo.isToday ? '0 0 0 2px #ffe4e6' : 'none'}
                  />
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        {/* 4. Minimal Legend */}
        <Flex
          mt={3}
          pt={2.5}
          borderTop="1px solid #f1f5f9"
          justify="center"
          align="center"
          gap={3}
          wrap="wrap"
          fontSize="11px"
          color="#64748b"
        >
          <HStack gap={1}>
            <Box w="6px" h="6px" borderRadius="full" bg="#10b981" />
            <Text>Present</Text>
          </HStack>
          <HStack gap={1}>
            <Box w="6px" h="6px" borderRadius="full" bg="#e11d48" />
            <Text>Leave</Text>
          </HStack>
          <HStack gap={1}>
            <Box w="6px" h="6px" borderRadius="full" bg="#f59e0b" />
            <Text>Half</Text>
          </HStack>
          <HStack gap={1}>
            <Box w="6px" h="6px" borderRadius="full" bg="#8b5cf6" />
            <Text>Paid</Text>
          </HStack>
          <HStack gap={1}>
            <Box w="6px" h="6px" borderRadius="full" bg="#94a3b8" />
            <Text>Off</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Day Detail Modal */}
      {modalDate && (
        <DayDetailModal
          key={modalDate}
          isOpen={!!modalDate}
          onClose={() => setModalDate(null)}
          helper={selectedHelper}
          dateStr={modalDate}
          currentRecord={currentRecord}
          onSave={(status, note) => {
            onSetAttendance(selectedHelper.id, modalDate, status, note);
          }}
          onRemove={() => {
            onRemoveAttendance(selectedHelper.id, modalDate);
          }}
        />
      )}
    </VStack>
  );
};
