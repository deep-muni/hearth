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
  isCountBased?: boolean;
  itemCount?: number;
  hasNote?: boolean;
}

export const DayCell: React.FC<DayCellProps> = memo(({
  dayInfo,
  status,
  onClick,
  isCountBased = false,
  itemCount,
  hasNote,
}) => {
  const isCurrentMonth = dayInfo.isCurrentMonth;
  const isToday = dayInfo.isToday;
  const statusCfg = STATUS_CONFIGS[status] || STATUS_CONFIGS.PRESENT;
  const Icon = statusCfg.icon;

  let cellBg = '#ffffff';
  if (!isCurrentMonth) {
    cellBg = '#fafafa';
  } else if (isCountBased) {
    cellBg = (itemCount !== undefined && itemCount > 0) ? '#eff6ff' : '#ffffff';
  } else {
    cellBg = statusCfg.bg;
  }

  const hasItems = isCountBased && itemCount !== undefined && itemCount > 0;

  return (
    <Box
      onClick={() => onClick(dayInfo)}
      h="46px"
      p={1}
      borderRadius="lg"
      border="1px solid"
      borderColor={isToday ? '#0f172a' : hasItems ? '#bfdbfe' : '#f1f5f9'}
      bg={cellBg}
      opacity={isCurrentMonth ? 1 : 0.25}
      cursor={isCurrentMonth ? 'pointer' : 'default'}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      transition="all 0.1s ease"
      userSelect="none"
      position="relative"
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
        isCountBased ? (
          hasItems ? (
            <Box
              mb={0.5}
              px={1.5}
              py={0.2}
              borderRadius="full"
              bg="#2563eb"
              color="#ffffff"
              fontSize="10px"
              fontWeight="700"
              lineHeight="1.2"
              display="flex"
              alignItems="center"
              gap={0.5}
            >
              <span>{itemCount}</span>
              {hasNote && (
                <Box w="3px" h="3px" borderRadius="full" bg="#fde047" />
              )}
            </Box>
          ) : (
            <Text fontSize="10px" color="#cbd5e1" mb={0.5}>
              -
            </Text>
          )
        ) : (
          <Box mb={0.5} display="flex" alignItems="center" justifyContent="center">
            <Icon size={11} strokeWidth={status === 'FULL_LEAVE' || status === 'PRESENT' ? 2.5 : 2} color={statusCfg.color} />
          </Box>
        )
      )}
    </Box>
  );
});

DayCell.displayName = 'DayCell';
