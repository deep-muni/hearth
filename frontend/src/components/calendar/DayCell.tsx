"use client";

import React, { memo } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { CalendarDayInfo } from '@/utils/dateUtils';
import { AttendanceStatus } from '@/types';
import { STATUS_CONFIGS } from '@/constants';

interface DayCellProps {
  dayInfo: CalendarDayInfo;
  status: AttendanceStatus;
  onClick: (dayInfo: CalendarDayInfo) => void;
}

export const DayCell: React.FC<DayCellProps> = memo(({ dayInfo, status, onClick }) => {
  const isCurrentMonth = dayInfo.isCurrentMonth;
  const isToday = dayInfo.isToday;
  const statusCfg = STATUS_CONFIGS[status] || STATUS_CONFIGS.PRESENT;
  const Icon = statusCfg.icon;

  let cellBg = '#ffffff';
  if (!isCurrentMonth) {
    cellBg = '#fafafa';
  } else {
    cellBg = statusCfg.bg;
  }

  return (
    <Box
      onClick={() => onClick(dayInfo)}
      h="46px"
      p={1}
      borderRadius="lg"
      border="1px solid"
      borderColor={isToday ? '#0f172a' : '#f1f5f9'}
      bg={cellBg}
      opacity={isCurrentMonth ? 1 : 0.25}
      cursor={isCurrentMonth ? 'pointer' : 'default'}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      transition="all 0.1s ease"
      userSelect="none"
    >
      <Text
        fontSize="12px"
        fontWeight={isToday ? '800' : '500'}
        color={isToday ? '#0f172a' : isCurrentMonth ? '#334155' : '#cbd5e1'}
        lineHeight="1"
        mt={0.5}
      >
        {dayInfo.dayNumber}
      </Text>

      {isCurrentMonth && (
        <Box mb={0.5} display="flex" alignItems="center" justifyContent="center">
          <Icon size={11} strokeWidth={status === 'FULL_LEAVE' || status === 'PRESENT' ? 2.5 : 2} color={statusCfg.color} />
        </Box>
      )}
    </Box>
  );
});

DayCell.displayName = 'DayCell';
