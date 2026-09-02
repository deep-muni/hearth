"use client";

import React, { memo } from 'react';
import { Box, SimpleGrid, Text, Flex, HStack } from '@chakra-ui/react';
import { CalendarDayInfo } from '@/utils/dateUtils';
import { AttendanceRecord, AttendanceStatus, HouseHelp } from '@/types';
import { DayCell } from './DayCell';
import { STATUS_CONFIGS, WEEKDAYS_SHORT } from '@/constants';

interface CalendarGridProps {
  calendarDays: CalendarDayInfo[];
  recordsByDate: Map<string, AttendanceRecord>;
  helper: HouseHelp;
  onCellClick: (dayInfo: CalendarDayInfo) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = memo(({
  calendarDays,
  recordsByDate,
  helper,
  onCellClick,
}) => {
  const isCountBased = helper.salaryType === 'COUNT_BASED';

  return (
    <Box
      bg="#ffffff"
      borderRadius="2xl"
      p={3}
      border="1px solid #e2e8f0"
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.02)"
    >
      <SimpleGrid columns={7} gap={1} mb={2}>
        {WEEKDAYS_SHORT.map((day, idx) => (
          <Box key={idx} textAlign="center" py={0.5}>
            <Text fontSize="11px" fontWeight="600" color={idx === 0 ? '#f43f5e' : '#94a3b8'}>
              {day}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={7} gap={1}>
        {calendarDays.map((dayInfo, idx) => {
          const isWeeklyOffDay =
            helper.weeklyOffDay >= 0 && dayInfo.dayOfWeek === helper.weeklyOffDay;
          const record = recordsByDate.get(dayInfo.dateStr);

          let status: AttendanceStatus = 'PRESENT';
          if (record?.status) {
            status = record.status;
          } else if (isWeeklyOffDay) {
            status = 'WEEKLY_OFF';
          }

          return (
            <DayCell
              key={`${dayInfo.dateStr}-${idx}`}
              dayInfo={dayInfo}
              status={status}
              onClick={onCellClick}
              isCountBased={isCountBased}
              itemCount={record?.itemCount}
              hasNote={!!record?.note}
            />
          );
        })}
      </SimpleGrid>

      {!isCountBased && (
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
          {(['PRESENT', 'FULL_LEAVE', 'HALF_LEAVE', 'PAID_LEAVE', 'WEEKLY_OFF'] as const).map(
            (st) => {
              const cfg = STATUS_CONFIGS[st];
              const Icon = cfg.icon;
              return (
                <HStack key={st} gap={1}>
                  <Icon size={11} color={cfg.color} strokeWidth={2.5} />
                  <Text>{cfg.shortLabel}</Text>
                </HStack>
              );
            }
          )}
        </Flex>
      )}
    </Box>
  );
});

CalendarGrid.displayName = 'CalendarGrid';
