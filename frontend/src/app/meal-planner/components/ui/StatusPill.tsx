'use client';

import React from 'react';
import { Text } from '@chakra-ui/react';

interface StatusPillProps {
  status: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const style =
    status === 'Today'
      ? { bg: 'var(--hh-accent)', color: '#ffffff' }
      : status === 'Edited'
        ? { bg: 'var(--hh-accentSoft)', color: 'var(--hh-accentInk)' }
        : { bg: 'var(--hh-sunken)', color: 'var(--hh-muted)' };

  return (
    <Text
      as="span"
      px="8px"
      py="2px"
      borderRadius="999px"
      fontSize="10.5px"
      fontWeight={600}
      letterSpacing="0.06em"
      textTransform="uppercase"
      {...style}
    >
      {status}
    </Text>
  );
};
