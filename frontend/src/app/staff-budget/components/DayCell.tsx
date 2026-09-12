'use client';

import React, { memo } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { CalendarDayInfo } from '@/utils/dateUtils';
import { AttendanceStatus } from '../types';
import { STATUS_CONFIGS } from '../constants';

interface DayCellProps {
  dayInfo: CalendarDayInfo;
  status?: AttendanceStatus;
  onClick: (dayInfo: CalendarDayInfo) => void;
  isCountBased?: boolean;
  itemCount?: number;
  hasRecord?: boolean;
}

export const DayCell: React.FC<DayCellProps> = memo(
  ({
    dayInfo,
    status = 'PRESENT',
    onClick,
    isCountBased = false,
    itemCount,
    hasRecord = false,
  }) => {
    const isCurrentMonth = dayInfo.isCurrentMonth;
    const isToday = dayInfo.isToday;

    const hasCount = isCountBased && itemCount !== undefined && itemCount > 0;
    const hasData = isCurrentMonth && (hasCount || (hasRecord && status));

    const statusCfg = STATUS_CONFIGS[status] || STATUS_CONFIGS.PRESENT;

    let cellBg = 'var(--hh-card)';
    if (!isCurrentMonth) {
      cellBg = 'transparent';
    } else if (hasData) {
      cellBg = 'var(--hh-accentSoft)';
    }

    return (
      <Button
        type="button"
        variant="ghost"
        disabled={!isCurrentMonth}
        onClick={() => isCurrentMonth && onClick(dayInfo)}
        aria-label={`Day ${dayInfo.dayNumber}`}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3px"
        aspectRatio="1 / 1.08"
        p="4px 2px"
        h="auto"
        w="100%"
        minW={0}
        borderRadius="12px"
        border={isToday ? '1.5px solid var(--hh-accent)' : '1px solid var(--hh-line)'}
        bg={cellBg}
        opacity={isCurrentMonth ? 1 : 0.38}
        cursor={isCurrentMonth ? 'pointer' : 'default'}
        transition="transform 150ms ease, background 180ms ease, border-color 180ms ease"
        _hover={
          isCurrentMonth
            ? {
                transform: 'scale(1.02)',
                borderColor: 'var(--hh-accent)',
                bg: cellBg,
              }
            : undefined
        }
      >
        <Text
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="12.5px"
          fontWeight={isToday ? 700 : 500}
          color={isCurrentMonth ? 'var(--hh-ink)' : 'var(--hh-muted)'}
          lineHeight="1"
          m={0}
        >
          {dayInfo.dayNumber}
        </Text>

        {isCurrentMonth ? (
          isCountBased ? (
            hasCount ? (
              <Box
                as="span"
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW="19px"
                h="19px"
                px="5px"
                borderRadius="999px"
                bg="var(--hh-accent)"
                color="#ffffff"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="11px"
                fontWeight={600}
                lineHeight="1"
              >
                {itemCount}
              </Box>
            ) : (
              <Text
                as="span"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12px"
                fontWeight={500}
                color="var(--hh-muted)"
                lineHeight="1"
                m={0}
              >
                ·
              </Text>
            )
          ) : (
            <Text
              as="span"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              fontWeight={700}
              color={statusCfg.color}
              lineHeight="1"
              m={0}
            >
              {statusCfg.glyph}
            </Text>
          )
        ) : (
          <Box h="13px" />
        )}
      </Button>
    );
  }
);

DayCell.displayName = 'DayCell';
