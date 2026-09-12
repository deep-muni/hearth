'use client';

import React from 'react';
import { Flex, HStack, Text, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import {
  formatMonthDisplay,
  getNextMonth,
  getPreviousMonth,
  formatCurrency,
} from '@/utils/dateUtils';

interface MonthBudgetBarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  totalMonthlyBudget: number;
}

export const MonthBudgetBar: React.FC<MonthBudgetBarProps> = ({
  currentMonth,
  onMonthChange,
  totalMonthlyBudget,
}) => {
  return (
    <Flex
      align="center"
      justify="space-between"
      gap="12px"
      p="12px 14px"
      borderRadius="16px"
      bg="var(--hh-card)"
      border="1px solid var(--hh-line)"
      transition="background-color 200ms ease, border-color 200ms ease"
    >
      <HStack gap="4px" align="center">
        <IconButton
          type="button"
          onClick={() => onMonthChange(getPreviousMonth(currentMonth))}
          aria-label="Previous month"
          variant="ghost"
          w="30px"
          h="30px"
          minW="30px"
          borderRadius="9px"
          p={0}
          color="var(--hh-muted)"
          transition="background 180ms ease, color 180ms ease"
          _hover={{
            bg: 'var(--hh-sunken)',
            color: 'var(--hh-ink)',
          }}
        >
          <ChevronLeftIcon size={15} strokeWidth={2} />
        </IconButton>

        <Text
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="14.5px"
          fontWeight={600}
          letterSpacing="-0.01em"
          color="var(--hh-ink)"
          minW="118px"
          textAlign="center"
          m={0}
          userSelect="none"
        >
          {formatMonthDisplay(currentMonth)}
        </Text>

        <IconButton
          type="button"
          onClick={() => onMonthChange(getNextMonth(currentMonth))}
          aria-label="Next month"
          variant="ghost"
          w="30px"
          h="30px"
          minW="30px"
          borderRadius="9px"
          p={0}
          color="var(--hh-muted)"
          transition="background 180ms ease, color 180ms ease"
          _hover={{
            bg: 'var(--hh-sunken)',
            color: 'var(--hh-ink)',
          }}
        >
          <ChevronRightIcon size={15} strokeWidth={2} />
        </IconButton>
      </HStack>

      <Flex
        align="baseline"
        gap="7px"
        px="12px"
        py="6px"
        borderRadius="999px"
        bg="var(--hh-accentSoft)"
      >
        <Text
          as="span"
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="10.5px"
          fontWeight={600}
          letterSpacing="0.1em"
          textTransform="uppercase"
          color="var(--hh-accentInk)"
          m={0}
        >
          Total
        </Text>
        <Text
          as="span"
          fontFamily="'Instrument Serif', Georgia, serif"
          fontSize="19px"
          lineHeight="1"
          color="var(--hh-accentInk)"
          m={0}
        >
          {formatCurrency(totalMonthlyBudget)}
        </Text>
      </Flex>
    </Flex>
  );
};
