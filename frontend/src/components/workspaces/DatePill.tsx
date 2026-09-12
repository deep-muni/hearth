'use client';

import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

const emptySubscribe = () => () => {};

export interface DatePillProps {
  className?: string;
}

export const DatePill: React.FC<DatePillProps> = ({ className }) => {
  const dateLine = React.useSyncExternalStore(
    emptySubscribe,
    () => {
      const now = new Date();
      const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString(undefined, { month: 'long' });
      return `${weekday} ${day} ${month}`;
    },
    () => ''
  );

  return (
    <HStack
      as="span"
      display="inline-flex"
      alignSelf="flex-start"
      gap="7px"
      px="11px"
      py="5px"
      pl="8px"
      borderRadius="full"
      bg="var(--hh-accentSoft, #DCE5EE)"
      color="var(--hh-accentInk, #233F5B)"
      fontFamily="'Instrument Sans', system-ui, sans-serif"
      fontSize="11.5px"
      fontWeight="600"
      letterSpacing="0.04em"
      whiteSpace="nowrap"
      className={className}
    >
      <Box
        w="6px"
        h="6px"
        borderRadius="full"
        bg="var(--hh-accent, #2F5D8A)"
        flexShrink={0}
        aria-hidden="true"
      />
      <Text as="span" fontSize="inherit" fontWeight="inherit" color="inherit" whiteSpace="nowrap">
        {dateLine || 'Today'}
      </Text>
    </HStack>
  );
};

DatePill.displayName = 'DatePill';
