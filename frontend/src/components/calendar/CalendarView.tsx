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
import {
  Check,
  X as XIcon,
  Minus,
  Gift,
  Coffee,
} from 'lucide-react';

interface CalendarViewProps {
  helpers: HouseHelp[];
  selectedHelperId: string;
  onSelectHelper: (id: string) => void;
  currentMonth: string;
  attendance: AttendanceRecord[];
  onSetAttendance: (helperId: string, date: string, status: AttendanceStatus, note?: string) => void;
  onRemoveAttendance: (helperId: string, date: string) => void;
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
  salaryCalculation,
}) => {
  const selectedHelper = helpers.find((h) => h.id === selectedHelperId) || helpers[0];
  const [modalDate, setModalDate] = useState<string | null>(null);

  if (!selectedHelper) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="13px" color="#94a3b8">
          No staff members found. Add one in the Staff tab.
        </Text>
      </Box>
    );
  }

  const calendarDays = buildCalendarDays(currentMonth);

  const recordsByDate = new Map<string, AttendanceRecord>();
  attendance
    .filter((a) => a.helperId === selectedHelper.id && a.date.startsWith(currentMonth))
    .forEach((r) => recordsByDate.set(r.date, r));

  const handleCellClick = (dayInfo: CalendarDayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    setModalDate(dayInfo.dateStr);
  };

  const handleFillPresent = () => {
    if (confirm(`Fill remaining working days in ${currentMonth} as Present for ${selectedHelper.name}?`)) {
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
    <VStack gap={3.5} align="stretch" maxW="440px" mx="auto" w="100%">
      {/* 1. Staff Selector (No horizontal scroll, all names visible) */}
      <SimpleGrid
        columns={helpers.length <= 3 ? helpers.length : helpers.length === 4 ? 2 : 3}
        gap={1.5}
      >
        {helpers.map((h) => {
          const isSelected = h.id === selectedHelper.id;
          const leaves = attendance
            .filter((a) => a.helperId === h.id && a.date.startsWith(currentMonth))
            .reduce((acc, curr) => {
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
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 6px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                background: isSelected ? '#0f172a' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <span>{h.avatarEmoji}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.name.split(' ')[0]}
              </span>
              {leaves > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#fee2e2',
                    color: isSelected ? '#ffffff' : '#dc2626',
                    fontWeight: 600,
                  }}
                >
                  {leaves}
                </span>
              )}
            </button>
          );
        })}
      </SimpleGrid>

      {/* 2. Staff Overview & Quick Action */}
      <Flex
        bg="#ffffff"
        borderRadius="xl"
        px={3.5}
        py={2}
        border="1px solid #f1f5f9"
        justify="space-between"
        align="center"
        fontSize="12px"
      >
        <Box>
          <Text fontWeight="700" color="#0f172a">
            {selectedHelper.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>• {selectedHelper.role}</span>
          </Text>
          <Text fontSize="11px" color="#64748b">
            {selectedHelper.salaryType === 'FIXED_MONTHLY' && `${formatCurrency(selectedHelper.baseSalary)}/mo • ${selectedHelper.paidLeavesAllowance} paid leaves`}
            {selectedHelper.salaryType === 'DAILY_WAGE' && `${formatCurrency(selectedHelper.baseSalary)}/day`}
            {selectedHelper.salaryType === 'STRICT_FLAT' && `${formatCurrency(selectedHelper.baseSalary)} flat`}
          </Text>
        </Box>

        <HStack gap={2}>
          {salaryCalculation && (
            <Text fontWeight="800" color="#0f172a">
              {formatCurrency(salaryCalculation.netPayable)}
            </Text>
          )}

          <button
            onClick={handleFillPresent}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Fill
          </button>
        </HStack>
      </Flex>

      {/* 3. Clean Minimal Calendar Grid */}
      <Box
        bg="#ffffff"
        borderRadius="2xl"
        p={3}
        border="1px solid #e2e8f0"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.02)"
      >
        {/* Day of Week Headers */}
        <SimpleGrid columns={7} gap={1} mb={2}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <Box key={idx} textAlign="center" py={0.5}>
              <Text fontSize="11px" fontWeight="600" color={idx === 0 ? '#f43f5e' : '#94a3b8'}>
                {day}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Days Matrix */}
        <SimpleGrid columns={7} gap={1}>
          {calendarDays.map((dayInfo, idx) => {
            const isWeeklyOffDay =
              selectedHelper.weeklyOffDay >= 0 && dayInfo.dayOfWeek === selectedHelper.weeklyOffDay;
            const record = recordsByDate.get(dayInfo.dateStr);

            let status: AttendanceStatus = 'PRESENT';
            if (record) {
              status = record.status;
            } else if (isWeeklyOffDay) {
              status = 'WEEKLY_OFF';
            }

            // Minimal styling
            let cellBg = '#ffffff';
            let iconElement = null;

            if (!dayInfo.isCurrentMonth) {
              cellBg = '#fafafa';
            } else {
              switch (status) {
                case 'FULL_LEAVE':
                  cellBg = '#fef2f2';
                  iconElement = <XIcon size={11} strokeWidth={2.5} color="#ef4444" />;
                  break;
                case 'HALF_LEAVE':
                  cellBg = '#fffbeb';
                  iconElement = <Minus size={11} strokeWidth={2.5} color="#f59e0b" />;
                  break;
                case 'PAID_LEAVE':
                  cellBg = '#f5f3ff';
                  iconElement = <Gift size={11} strokeWidth={2} color="#8b5cf6" />;
                  break;
                case 'WEEKLY_OFF':
                  cellBg = '#f8fafc';
                  iconElement = <Coffee size={11} strokeWidth={2} color="#94a3b8" />;
                  break;
                case 'PRESENT':
                default:
                  cellBg = '#f8fafc';
                  iconElement = <Check size={11} strokeWidth={2.5} color="#10b981" />;
                  break;
              }
            }

            return (
              <Box
                key={`${dayInfo.dateStr}-${idx}`}
                onClick={() => handleCellClick(dayInfo)}
                h="46px"
                p={1}
                borderRadius="lg"
                border="1px solid"
                borderColor={dayInfo.isToday ? '#0f172a' : '#f1f5f9'}
                bg={cellBg}
                opacity={dayInfo.isCurrentMonth ? 1 : 0.25}
                cursor={dayInfo.isCurrentMonth ? 'pointer' : 'default'}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="space-between"
                transition="all 0.1s ease"
              >
                <Text
                  fontSize="12px"
                  fontWeight={dayInfo.isToday ? '800' : '500'}
                  color={dayInfo.isToday ? '#0f172a' : dayInfo.isCurrentMonth ? '#334155' : '#cbd5e1'}
                  lineHeight="1"
                  mt={0.5}
                >
                  {dayInfo.dayNumber}
                </Text>

                {dayInfo.isCurrentMonth && (
                  <Box mb={0.5} display="flex" alignItems="center" justifyContent="center">
                    {iconElement}
                  </Box>
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Minimal Legend Row */}
        <Flex
          mt={3}
          pt={2}
          borderTop="1px solid #f1f5f9"
          justify="center"
          align="center"
          gap={3}
          fontSize="11px"
          color="#64748b"
        >
          <HStack gap={1}>
            <Check size={11} color="#10b981" />
            <Text>Present</Text>
          </HStack>
          <HStack gap={1}>
            <XIcon size={11} color="#ef4444" />
            <Text>Leave</Text>
          </HStack>
          <HStack gap={1}>
            <Minus size={11} color="#f59e0b" />
            <Text>Half</Text>
          </HStack>
          <HStack gap={1}>
            <Gift size={11} color="#8b5cf6" />
            <Text>Paid</Text>
          </HStack>
          <HStack gap={1}>
            <Coffee size={11} color="#94a3b8" />
            <Text>Off</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Day Detail Sheet / Modal */}
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
