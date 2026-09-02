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
import { buildCalendarDays, CalendarDayInfo, formatCurrency } from '@/utils/dateUtils';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailModal } from './DayDetailModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
    <VStack gap={3} align="stretch" w="100%">
      {/* 1. Staff Selector (Responsive Grid, No Scroll) */}
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
                <Badge
                  variant="danger"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#fee2e2',
                    color: isSelected ? '#ffffff' : '#dc2626',
                    border: 'none',
                  }}
                >
                  {leaves}
                </Badge>
              )}
            </button>
          );
        })}
      </SimpleGrid>

      {/* 2. Staff Overview & Fill Action */}
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

          <Button variant="secondary" size="xs" onClick={handleFillPresent}>
            Fill
          </Button>
        </HStack>
      </Flex>

      {/* 3. Calendar Grid */}
      <CalendarGrid
        calendarDays={calendarDays}
        recordsByDate={recordsByDate}
        helper={selectedHelper}
        onCellClick={handleCellClick}
      />

      {/* 4. Day Detail Modal */}
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
