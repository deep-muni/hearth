'use client';

import React, { memo } from 'react';
import { Box, SimpleGrid, Text, Flex, HStack } from '@chakra-ui/react';
import { CalendarDayInfo } from '@/utils/dateUtils';
import { AttendanceRecord, AttendanceStatus, StaffMember } from '../types';
import { DayCell } from './DayCell';
import { STATUS_CONFIGS, WEEKDAYS_SHORT } from '../constants';

interface CalendarGridProps {
  calendarDays: CalendarDayInfo[];
  recordsByDate: Map<string, AttendanceRecord>;
  staff: StaffMember;
  onCellClick: (dayInfo: CalendarDayInfo) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = memo(
  ({ calendarDays, recordsByDate, staff, onCellClick }) => {
    if (!staff) return null;
    const isCountBased = staff.salaryType === 'COUNT_BASED';

    return (
      <Box
        bg="var(--hh-card)"
        borderRadius="20px"
        p="16px 14px 14px"
        border="1px solid var(--hh-line)"
        boxShadow="0 1px 2px rgba(28, 26, 23, 0.03)"
      >
        <SimpleGrid columns={7} gap="6px" mb="10px">
          {WEEKDAYS_SHORT.map((day, idx) => (
            <Text
              key={idx}
              textAlign="center"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="10.5px"
              fontWeight={600}
              letterSpacing="0.08em"
              color={idx === 0 || idx === 6 ? 'var(--hh-accentInk)' : 'var(--hh-muted)'}
              m={0}
              userSelect="none"
            >
              {day}
            </Text>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={7} gap="6px">
          {calendarDays.map((dayInfo, idx) => {
            const isWeeklyOffDay =
              staff.weeklyOffDay >= 0 && dayInfo.dayOfWeek === staff.weeklyOffDay;
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
                hasRecord={!!record}
              />
            );
          })}
        </SimpleGrid>

        {!isCountBased && (
          <Flex
            wrap="wrap"
            justify="center"
            gap="6px 14px"
            mt="12px"
            pt="12px"
            borderTop="1px solid var(--hh-line)"
          >
            {(['PRESENT', 'FULL_LEAVE', 'HALF_LEAVE', 'PAID_LEAVE', 'WEEKLY_OFF'] as const).map(
              (st) => {
                const cfg = STATUS_CONFIGS[st];
                return (
                  <HStack key={st} gap="5px" align="center">
                    <Text
                      as="span"
                      fontFamily="'Instrument Sans', system-ui, sans-serif"
                      fontSize="12px"
                      fontWeight={700}
                      color={cfg.color}
                      lineHeight="1"
                      m={0}
                    >
                      {cfg.glyph}
                    </Text>
                    <Text
                      as="span"
                      fontFamily="'Instrument Sans', system-ui, sans-serif"
                      fontSize="11.5px"
                      fontWeight={500}
                      color="var(--hh-muted)"
                      m={0}
                    >
                      {cfg.shortLabel}
                    </Text>
                  </HStack>
                );
              }
            )}
          </Flex>
        )}
      </Box>
    );
  }
);

CalendarGrid.displayName = 'CalendarGrid';
