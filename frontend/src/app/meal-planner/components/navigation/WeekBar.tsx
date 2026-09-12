'use client';

import React, { useMemo } from 'react';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatWeekRangeDisplay } from '@/utils/dateUtils';

interface WeekBarProps {
  weekStart: string;
  isCurrentWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const WeekBar: React.FC<WeekBarProps> = ({
  weekStart,
  isCurrentWeek,
  onPrevious,
  onNext,
}) => {
  const label = useMemo(() => {
    const start = new Date(`${weekStart}T00:00:00`);
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - currentStart.getDay());
    currentStart.setHours(0, 0, 0, 0);
    const diff = Math.round((start.getTime() - currentStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (diff === 0) return 'This week';
    if (diff === 1) return 'Next week';
    if (diff === -1) return 'Last week';
    return null;
  }, [weekStart]);

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="10px"
      p="11px 12px"
      borderRadius="16px"
      bg="var(--hh-card)"
      border="1px solid var(--hh-line)"
    >
      <IconButton
        type="button"
        aria-label="Previous week"
        onClick={onPrevious}
        variant="ghost"
        w="30px"
        h="30px"
        minW="30px"
        borderRadius="9px"
        color="var(--hh-muted)"
        _hover={{ bg: 'var(--hh-sunken)', color: 'var(--hh-ink)' }}
      >
        <ChevronLeft size={17} />
      </IconButton>
      <Flex align="center" justify="center" gap="8px" minW="0">
        <Text
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="14.5px"
          fontWeight={600}
          color="var(--hh-ink)"
          whiteSpace="nowrap"
          minW="0"
        >
          {formatWeekRangeDisplay(weekStart)}
        </Text>
        {(label || isCurrentWeek) && (
          <Text
            as="span"
            px="8px"
            py="2px"
            borderRadius="999px"
            bg="var(--hh-accentSoft)"
            color="var(--hh-accentInk)"
            fontSize="10.5px"
            fontWeight={600}
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            {label || 'This week'}
          </Text>
        )}
      </Flex>
      <IconButton
        type="button"
        aria-label="Next week"
        onClick={onNext}
        variant="ghost"
        w="30px"
        h="30px"
        minW="30px"
        borderRadius="9px"
        color="var(--hh-muted)"
        _hover={{ bg: 'var(--hh-sunken)', color: 'var(--hh-ink)' }}
      >
        <ChevronRight size={17} />
      </IconButton>
    </Flex>
  );
};
